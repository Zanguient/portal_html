/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.2 - 04/04/2016
 *  - Modelo da conciliação de títulos 
 *
 *  Versão 1.0.1 - 07/10/2015
 *  - Criação das tabs para as abas.  
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("card-services-conciliacao-vendas", []) 

.controller("card-services-conciliacao-vendasCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             '$http',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,$http,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // flags
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200];                                             
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados    
    $scope.dadosconciliacao = [];
    $scope.totais = { valorTotal : 0.0,
                      contVendas : 0, contRecebimentos : 0,
                    };
    var totalPreConciliados = 0;                                            
    $scope.adquirentes = [];
    $scope.filiais = [];                                                                                       
    $scope.tipos = [{id: 1, nome: 'CONCILIADO'}, {id: 2, nome: 'PRÉ-CONCILIADO'}, {id: 3, nome: 'NÃO CONCILIADO'}];             
    $scope.filtro = {datamin : new Date(), datamax : '', nsu : '',
                     tipo : null, adquirente : undefined, filial : undefined, considerarGrupo : false,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };  
                                                 
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyDadosPos = 1;  
    // Modal Busca Vendas
    $scope.modalBuscaVendas = {recebimento : null, vendas : [], buscandovendas : false, filial : null };   
    // Permissões                                           
    var permissaoAlteracao = false;   
    // flags                                                  
    $scope.exibeTela = false;    
    $scope.abrirCalendarioDataMin = $scope.abrirCalendarioDataVendaMin = false;
    $scope.abrirCalendarioDataMax = $scope.abrirCalendarioDataVendaMax = false; 
    
    // Inicialização do controller
    $scope.cardServices_conciliacaoVendasInit = function(){
        // Venda da página 
        $scope.pagina.venda = 'Card Services';                          
        $scope.pagina.subvenda = 'Conciliação de Vendas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                    buscaFiliais(true);
                }else{ // reseta tudo e não faz buscas 
                    $scope.dadosconciliacao = []; 
                    $scope.filiais = [];
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                    
                    $scope.filtro.faixa_registros = '0-0';
                    $scope.filtro.total_registros = 0;
                    $scope.filtro.pagina = 1;
                    
                    $scope.totais.valorTotal = 0.0;
                    $scope.totais.contVendas = 0;
                    $scope.totais.contRecebimentos = 0;
                }
                
            }
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false; 
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            // ....
        });
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        if($scope.usuariologado.grupoempresa) buscaFiliais(true);
    };
    
    
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode alterar dados de conciliação de vendas
      */
    $scope.usuarioPodeAlterarDadosConciliacaoVendas = function(){
        return permissaoAlteracao;
    } 
    
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        // Limpar data => Refazer busca?
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.adquirente = $scope.filtro.tipo = null; 
        
        if($scope.filiais.length > 0 && $scope.filtro.filial !== $scope.filiais[0]){
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false); 
        }
    }
    
     /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(){
       var filtros = [];
       
       // Data
       var filtroData = {id: /*$campos.card.conciliacaovendas.data*/ 100,
                         valor: $scope.getFiltroData($scope.filtro.datamin)}; 
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       filtros.push(filtroData);
        
       // Filial
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           var filtroFilial = {id: /*$campos.card.conciliacaovendas.nu_cnpj*/ 103, 
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: 200,//$campos.card.conciliacaovendas.tbadquirente + $campos.card.tbadquirente.cdAdquirente - 100, 
                                   valor: $scope.filtro.adquirente.cdAdquirente};
           filtros.push(filtroAdquirente);
       } 
        
       // Tipo
       if($scope.filtro.tipo && $scope.filtro.tipo !== null){
           var filtroTipo = {id: /*$campos.card.conciliacaovendas.tipo*/101, 
                             valor: $scope.filtro.tipo.id};
           filtros.push(filtroTipo);
       }   
        
       // Pré-Conciliação considerando grupo
       if($scope.isTipoPreConciliado()){
            filtros.push({id: /*$campos.card.conciliacaovendas.preconcilia_grupo*/104, 
                          valor: $scope.filtro.considerarGrupo ? true : false});
       }
        
       // NSU
       if($scope.filtro.nsu && $scope.filtro.nsu !== null){
           filtros.push({id: /*$campos.card.conciliacaovendas.nsu*/105, 
                          valor: $scope.filtro.nsu + '%'});
       }
        
       // Retorna    
       return filtros;
    };
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
      ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
       if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
       else ajustaIntervaloDeData();
    };
																							 
																							 
                                                 
    // FILIAIS                                             
    
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(buscarAdquirentes, nu_cnpj, cdAdquirente){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];

       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1}); 
        
       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = $scope.filiais[0];
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                if(buscarAdquirentes)//$scope.filtro.filial && $scope.filtro.filial !== null)
                    buscaAdquirentes(true, cdAdquirente); // Busca adquirentes
                else
                    $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.filial);
        buscaAdquirentes(false);
    };
    
                                                                                         
    // ADQUIRENTES                                     
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto, cdAdquirente){ 
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103,
                       valor : 1}];
        
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           // Filtro do grupo empresa => barra administrativa
           filtros.push({id: /*$campos.card.tbadquirente.cnpj*/ 305,
                         valor: $scope.filtro.filial.nu_cnpj});
       }  
       
       
       $webapi.get($apis.getUrl($apis.card.tbadquirente, 
                                [$scope.token, 0, /*$campos.card.tbadquirente.nmAdquirente*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(!cdAdquirente) $scope.filtro.adquirente = $scope.adquirentes[0]; //null; 
                else $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.cdAdquirente === cdAdquirente;})[0];
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(){
        // ...
    };
    
    
    // TIPO CONCILIAÇÃO
    $scope.isTipoPreConciliado = function(){
        // considera a opção TODAS também
        return !$scope.filtro.tipo || $scope.filtro.tipo === null || $scope.filtro.tipo.id === $scope.tipos[1].id;    
    }
    $scope.alterouTipo = function(){
        //console.log($scope.filtro.tipo); 
        //if(!$scope.isTipoPreConciliado()) $scope.filtro.considerarGrupo = false;
    }
    
    
    $scope.temElementosPreConciliados = function(){
        return totalPreConciliados > 0;
    }
    $scope.incrementaTotalPreConciliados = function(incrementa){
        if(incrementa) totalPreConciliados++;    
    }
    
    
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           $scope.buscaDadosConciliacao();
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.dadosconciliacao.length > 0) $scope.buscaDadosConciliacao();
    }; 
    
    
    
    
    // BUSCA
    
    $scope.buscaDadosConciliacao = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        if(!$scope.filtro.adquirente || $scope.usuariologado.adquirente === null){
           $scope.showModalAlerta('É necessário selecionar uma adquirente!');
           return;
        }
        // Intervalo de data
        if($scope.filtro.datamax){
            var timeDiff = Math.abs($scope.filtro.datamax.getTime() - $scope.filtro.datamin.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            if(diffDays > 31){
                var periodo = diffDays <= 366 ? diffDays + ' dias' : 'mais de um ano';
                $scope.showModalAlerta('Por favor, selecione um intervalo de data de no máximo 31 dias. (Sua seleção consta ' + periodo + ')', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                                    }
                                  );
                return; 
            }
        }
        buscaDadosConciliacaoVendas();
    }
    
    var buscaDadosConciliacaoVendas = function(progressoemexecucao){
        if(!$scope.usuariologado.grupoempresa || (!$scope.filtro.adquirente || $scope.usuariologado.adquirente === null)) 
            return;
        
        if(!progressoemexecucao){
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyDadosPos);
        }
        
        // Filtro  
        var filtros = obtemFiltroDeBusca();
           
        $webapi.get($apis.getUrl($apis.card.conciliacaovendas, 
                                [$scope.token, 0, 
                                 /*$campos.card.conciliacaovendas.data*/ 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){       
            
                $scope.totais.contVendas = $scope.totais.contRecebimentos = totalPreConciliados = 0;
            
                // Obtém os dados
                $scope.dadosconciliacao = dados.Registros;
                
                $scope.totais.valorTotal = dados.Totais.valor;    
                
                
                //console.log($scope.dadosconciliacao);
                //console.log($scope.totais.totalExtrato);
                //console.log($scope.totais.totalRecebimentosParcela);
            
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.dadosconciliacao.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyDadosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter dados da conciliação de vendas (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyDadosPos);
              });  
    }
    
    /**
      * Incrementa o total de registros associados a recebimento
      */
    $scope.incrementaContRecebimentos = function(Recebimento){
        if(Recebimento != null) $scope.totais.contRecebimentos += 1;
    }
    /**
      * Incrementa o total de registros associados a venda
      */
    $scope.incrementaContVendas = function(Venda){
        if(Venda != null) $scope.totais.contVendas += 1;
    }
    
    
    
    
    // AÇÕES
    /**
      * Solicita confirmação para o usuário quanto a desconciliação
      */
    $scope.desconcilia = function(dado){
        var dadoV = angular.copy(dado);
        dadoV.Venda.Id = -1; // desfazer conciliação
        //console.log(dado);
        //console.log(dadoV);
        $scope.showModalConfirmacao('Confirmação', 
            "Tem certeza que deseja desfazer a conciliação selecionada?",
            concilia, [dadoV], 'Sim', 'Não');  
    }
    /**
      * Solicita confirmação para o usuário quanto a conciliação
      */
    $scope.concilia = function(dado){
        // Confirma conciliação
        $scope.showModalConfirmacao('Confirmação', 
            "Uma vez confirmada a conciliação, o venda e a carga não poderão se envolver em outra conciliação de vendas. Confirma essa conciliação?",
            concilia, [dado], 'Sim', 'Não');  
    }
    /**
      * Solicita confirmação para o usuário quanto a(s) conciliação(ões)
      */
    $scope.conciliaPreConciliados = function(){
        var preConciliados = $filter('filter')($scope.dadosconciliacao, function(c){ return c.Conciliado === 2 }); 
        var total = preConciliados.length;
        // Tem elementos pré-conciliados?
        if(total === 0){
            $scope.showModalAlerta('Não há dados pré-conciliados em exibição!');
            return;        
        } 
        // Prepara o texto
        var texto = "";
        if(total === 1){
            texto += "Foi encontrada 1 pré-conciliação. Uma vez confirmada a conciliação, o venda e a carga não poderão se envolver em outra conciliação de vendas. Confirma essa conciliação?"
        }else texto += "Foram encontradas " + total + " pré-conciliações. Uma vez confirmadas as conciliações, os vendas e as cargas não poderão se envolver em outra conciliação de vendas. Confirma essas conciliações?";
        // Exibe o modal de confirmação
        $scope.showModalConfirmacao('Confirmação', texto, concilia, preConciliados, 'Sim', 'Não');
    }
    /**
      * Efetiva a conciliação
      */
    var concilia = function(dadosConciliacao, buscar){
        
        //if(modalVendasIsVisible()) fechaModalVendas();
        
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyDadosPos);
        
        // Obtém o json
        var jsonConciliacaoVendas = [];
        for(var k = 0; k < dadosConciliacao.length ; k++){
            var dado = dadosConciliacao[k];
            //console.log("DADO");console.log(dado);
            jsonConciliacaoVendas.push({ idRecebimentoVenda : parseInt(dado.Venda.Id), 
                                         idRecebimento : parseInt(dado.Recebimento.Id),
                                       });
        }
        
        //console.log(jsonConciliacaoVendas);
        
        $webapi.update($apis.getUrl($apis.card.conciliacaovendas, undefined,
                       {id: 'token', valor: $scope.token}), jsonConciliacaoVendas)
            .then(function(dados){
                    //$scope.showAlert('Conciliação de vendas realizada com sucesso!', true, 'success', true);
                    if(buscar || jsonConciliacaoVendas[0].idRecebimentoVenda === -1)
                        buscaDadosConciliacaoVendas(true);
                    else{
                        // Altera o status da conciliação
                        for(var k = 0; k < dadosConciliacao.length; k++) dadosConciliacao[k].Conciliado = 1;  
                        if(!$scope.$$phase) $scope.$apply();
                        // Esconde o progress
                        $scope.hideProgress(divPortletBodyFiltrosPos);
                        $scope.hideProgress(divPortletBodyDadosPos);
                    }
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao realizar a conciliação de vendas (' + failData.status + ')', true, 'danger', true); 
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyDadosPos);
                  });     
    }

                                                 
                                                 
    // BUSCA VENDAS   
    /**
      * Selecionou um recebimento para buscar vendas
      */
    $scope.buscaVendas = function(dado){        
        if(!dado.Recebimento || dado.Recebimento === null) return;
        $scope.modalBuscaVendas.recebimento = dado.Recebimento;
        $scope.modalBuscaVendas.vendas = [];
        $scope.modalBuscaVendas.filial = $filter('filter')($scope.filiais, function(f){return $scope.getNomeAmigavelFilial(f) === dado.Recebimento.Filial})[0];
        // Exibe o modal
        $('#modalVendas').modal('show');
        buscaVendas();
    }
    
    var modalVendasIsVisible = function(){
        return $('modalVendas').is(':visible');
    }
    
    var fechaModalVendas = function(){
       $('#modalVendas').modal('hide'); 
    }
    
    /**
      * Busca vendas em outra filial
      */
    $scope.buscaVendasFilial = function(nu_cnpj){
        if(nu_cnpj) buscaVendas(nu_cnpj);
    }
    
    
    /**
      * Busca vendas
      */
    var buscaVendas = function(nu_cnpj){
       if(!$scope.modalBuscaVendas.recebimento || $scope.modalBuscaVendas.recebimento === null)
            return;
        
        $scope.modalBuscaVendas.buscandovendas = true;
        
        $scope.showProgress();
        
        // Filtro  
        var filtros = {id: /*$campos.card.conciliacaovendas.recebimento + $campos.pos.recebimento.id - 100*/ 300, 
                        valor: $scope.modalBuscaVendas.recebimento.Id};
        
        // Busca para uma filial específica
        if(typeof nu_cnpj === 'string'){
            filtros.push({id: /*$campos.card.conciliacaovendas.nu_cnpj*/ 103, 
                          valor: nu_cnpj});
        }
           
        $webapi.get($apis.getUrl($apis.card.conciliacaovendas, [$scope.token, 1], filtros)) 
            .then(function(dados){       
                // Obtém os dados
                $scope.modalBuscaVendas.vendas = dados.Registros;   
                $scope.modalBuscaVendas.buscandovendas = false;
                // Fecha o progress
                $scope.hideProgress();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao consultar vendas (' + failData.status + ')', true, 'danger', true);
                 $scope.modalBuscaVendas.buscandovendas = false;
                 // Fecha o progress
                 $scope.hideProgress();
              });           
    }
    
    
    /**
      * Concilia recebível selecionada com o venda
      */
    $scope.conciliarVenda = function(venda){
        //console.log(venda);
        var dado = {Recebimento : $scope.modalBuscaVendas.recebimento,
                    Venda : venda};
        //console.log(dado);
        // Confirma conciliação
        $scope.showModalConfirmacao('Confirmação', 
            "Uma vez confirmada a conciliação, o venda e a carga não poderão se envolver em outra conciliação de vendas. Confirma essa conciliação do recebível com valor de " + $filter('currency')($scope.modalBuscaVendas.recebimento.Valor, 'R$', 2) + ' e a venda com valor de ' + $filter('currency')(venda.Valor, 'R$', 2) + ' (diferença de ' + $filter('currency')(Math.abs(venda.Valor - $scope.modalBuscaVendas.recebimento.Valor), 'R$', 2) + ')?',
            function(){ fechaModalVendas(); 
                       $timeout(function(){concilia([dado], true);}, 300);}, undefined, 'Sim', 'Não');
    }
    
    
    /**
      * Concilia TEF-NSU
      * /
    $scope.conciliaTefNsu = function(){
        
        return;
        
        if(!$scope.filtro.filial || $scope.filtro.filial === null ||
           !$scope.filtro.adquirente || $scope.filtro.adquirente === null)
            return;
        
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyDadosPos);
        
        // Obtém o json
        var json = { data : $scope.getFiltroData($scope.filtro.datamin),
                     nrCNPJ : $scope.filtro.filial.nu_cnpj,
                     cdAdquirente : $scope.filtro.adquirente.cdAdquirente
                   }; 
        if($scope.filtro.datamax)
            json.data = json.data + '|' + $scope.getFiltroData($scope.filtro.datamax);        
        
        
        $webapi.post($apis.getUrl($apis.card.conciliacaovendas, undefined,
                       {id: 'token', valor: $scope.token}), json)
            .then(function(dados){
                    //$scope.showAlert('Conciliação de vendas TEF-NSU realizada com sucesso!', true, 'success', true);
                    buscaDadosConciliacaoVendas(true);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao realizar a conciliação de vendas TEF-NSU (' + failData.status + ')', true, 'danger', true); 
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyDadosPos);
                  });     
    }*/
    
    
    
    
    // NSU
    $scope.resetaBuscaNSU = function(){
        $scope.filtro.nsu = '';
        $scope.buscaDadosConciliacao();
    }
    
    
    
    
    
    // CORRIGE VENDAS
    
    /**
      * Correção da venda no ERP
      */
    $scope.corrigeVenda = function(dado)
    {
        if(!dado || dado === null || !dado.Venda || dado.Venda === null || !dado.Recebimento || dado.Recebimento === null || dado.Conciliado !== 1)
            return;

        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyDadosPos);
     
        var url = $apis.getUrl($apis.card.correcaovendaerp, undefined, {id: 'token', valor: $scope.token});
        
        // Seta para a url de download
        if(url.slice(0, "http://localhost:".length) !== "http://localhost:")
            url = url.replace($autenticacao.getUrlBase(), $autenticacao.getUrlBaseDownload());
        
        // Apenas uma venda
        var json = { idsRecebimento : [dado.Recebimento.Id] };
        
        $webapi.update(url, json)
            .then(function(dados){   
                buscaDadosConciliacaoVendas(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showModalAlerta('Houve uma falha ao realizar a correção no ERP. (' + (failData.dados && failData.dados !== null ? failData.dados : failData.status) + ')', 'Erro');
                 // Fecha os progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyDadosPos);
              }); 
    }
    
    /**
      * Correção das vendas conciliadas
      */
    $scope.corrigeVendas = function()
    {
        if(!$scope.filtro.adquirente || $scope.filtro.adquirente === null)
            return;

        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyDadosPos);
     
        var url = $apis.getUrl($apis.card.correcaovendaerp, undefined, {id: 'token', valor: $scope.token});
        
        // Seta para a url de download
        if(url.slice(0, "http://localhost:".length) !== "http://localhost:")
            url = url.replace($autenticacao.getUrlBase(), $autenticacao.getUrlBaseDownload());
        
        // Filtros
        var json = { data : $scope.getFiltroData($scope.filtro.datamin),
                     nrCNPJ : $scope.filtro.filial && $scope.filtro.filial !== null ? $scope.filtro.filial.nu_cnpj : null,
                     cdAdquirente : $scope.filtro.adquirente.cdAdquirente
                   }; 
        if($scope.filtro.datamax)
            json.data = json.data + '|' + $scope.getFiltroData($scope.filtro.datamax); 
        
        $webapi.update(url, json)
            .then(function(dados){   
                buscaDadosConciliacaoVendas(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showModalAlerta('Houve uma falha ao realizar a correção no ERP. (' + (failData.dados && failData.dados !== null ? failData.dados : failData.status) + ')', 'Erro');
                 // Fecha os progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyDadosPos);
              }); 
    }
    
}]);