/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão: 1.0.1 - 04/09/2015
 *  - Movimentações bancárias não pré-conciliadas podem ser associadas manualmente com um grupo de Recebimentos
 *
 *  Versão: 1.0 - 03/09/2015
 *
 */

// App
angular.module("card-services-conciliacao-bancaria", []) 

.controller("card-services-conciliacao-bancariaCtrl", ['$scope',
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
    $scope.totais = { totalExtrato : 0.0, totalRecebimentosParcela : 0.0,
                      contExtrato : 0, contRecebimentosParcela : 0,
                    };
    var totalPreConciliados = 0;                                            
    $scope.adquirentes = [];
    $scope.filiais = [];
    $scope.tipos = [{id: 1, nome: 'CONCILIADO'}, {id: 2, nome: 'PRÉ-CONCILIADO'}, {id: 3, nome: 'NÃO CONCILIADO'}];             
    $scope.filtro = {datamin : new Date(), datamax : '', consideraPeriodo : true,
                     tipo : null, adquirente : undefined, filial : undefined,
                     itens_pagina : $scope.itens_pagina[1], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };  
    
    $scope.associacaoManual = { selecionandoRecebimentos : false,
                                extrato : null,
                                dtExtrato : '',
                                valorExtrato : 0.0,
                                adquirenteExtrato : '',
                                recebimentos : null
                              }; 
                                                 
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyDadosPos = 1;  
    // Modal Detalhes
    $scope.modalDetalhes = {grupo : [] };  
    // Modal Data de Recebimento
    $scope.modalDataRecebimento = { dado : undefined, data : '', dataValida : false };  
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;     
    // flags                                                  
    $scope.exibeTela = false;    
    $scope.abrirCalendarioDataMin = $scope.abrirCalendarioDataVendaMin = false;
    $scope.abrirCalendarioDataMax = $scope.abrirCalendarioDataVendaMax = false; 
    
    
    
    // Inicialização do controller
    $scope.cardServices_conciliacaoBancariaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Conciliação Bancária';
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
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.dadosconciliacao = []; 
                    $scope.filiais = [];
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                }
                
            }
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            if($scope.usuariologado.grupoempresa) buscaFiliais();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    };
    
    
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar dados de conciliação bancária
      */
    $scope.usuarioPodeCadastrarDadosConciliacaoBancaria = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar dados de conciliação bancária
      */
    $scope.usuarioPodeAlterarDadosConciliacaoBancaria = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir dados de conciliação bancária
      */
    $scope.usuarioPodeExcluirDadosConciliacaoBancaria = function(){
        return permissaoRemocao;
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
    
       if($scope.filtro.consideraPeriodo){    
           // Data
           var filtroData = {id: /*$campos.card.conciliacaobancaria.data*/ 100,
                             valor: $scope.getFiltroData($scope.filtro.datamin)}; 
           if($scope.filtro.datamax)
               filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
           filtros.push(filtroData);
       }
    
       // Filial
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           var filtroFilial = {id: /*$campos.card.conciliacaobancaria.nu_cnpj*/ 103, 
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: 200,//$campos.card.conciliacaobancaria.operadora + $campos.pos.operadora.id - 100, 
                                   valor: $scope.filtro.adquirente.id};
           filtros.push(filtroAdquirente);
       } 
        
       // Tipo
       if($scope.filtro.tipo && $scope.filtro.tipo !== null){
           var filtroTipo = {id: /*$campos.card.conciliacaobancaria.tipo*/101, 
                             valor: $scope.filtro.tipo.id};
           filtros.push(filtroTipo);
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
    var buscaFiliais = function(nu_cnpj, idOperadora){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros = [{id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo}];
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
                if($scope.filtro.filial && $scope.filtro.filial !== null)
                    buscaAdquirentes(true, idOperadora); // Busca adquirentes
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
    var buscaAdquirentes = function(progressEstaAberto, idOperadora){
 
       if(!$scope.filtro.filial || $scope.filtro.filial === null){
           $scope.filtro.adquirente = null;
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;


       // Filtro do grupo empresa => barra administrativa
       filtros = {id: 300,
                 //id: $campos.pos.operadora.empresa + $campos.cliente.empresa.nu_cnpj - 100, 
                  valor: $scope.filtro.filial.nu_cnpj};
       
       $webapi.get($apis.getUrl($apis.pos.operadora, 
                                [$scope.token, 0, /*$campos.pos.operadora.nmOperadora*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(!idOperadora) $scope.filtro.adquirente = $scope.adquirentes[0]; //null; 
                else $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.id === idOperadora;})[0];
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
    $scope.isTipoNaoConciliado = function(){
        return $scope.filtro.tipo && $scope.filtro.tipo !== null && $scope.filtro.tipo.id === $scope.tipos[2].id;    
    }
    $scope.alterouTipo = function(){
        //console.log($scope.filtro.tipo); 
        if(!$scope.isTipoNaoConciliado()) $scope.filtro.consideraPeriodo = true;
    }
    
    $scope.selecionouCheckboxSemData = function(){
        //console.log($scope.filtro.consideraPeriodo);     
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
        if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
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
        buscaDadosConciliacaoBancaria();
    }
    
    var buscaDadosConciliacaoBancaria = function(progressoemexecucao){
        if(!$scope.usuariologado.grupoempresa ||  !$scope.filtro.filial || $scope.filtro.filial === null) 
            return;
        
        if(!progressoemexecucao){
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyDadosPos);
        }
        
        // Filtro  
        var filtros = obtemFiltroDeBusca();
           
        $webapi.get($apis.getUrl($apis.card.conciliacaobancaria, 
                                [$scope.token, 0, 
                                 /*$campos.card.conciliacaobancaria.data*/ 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           
            
                // Desassocia possível conciliação manual não finalizada
                $scope.desassociaExtratoBancario();
            
                $scope.totais.contExtrato = $scope.totais.contRecebimentosParcela = totalPreConciliados = 0;
            
                // Obtém os dados
                $scope.dadosconciliacao = dados.Registros;
                
                $scope.totais.totalExtrato = dados.Totais.valorExtrato;
                $scope.totais.totalRecebimentosParcela = dados.Totais.valorRecebimento;    
                
                
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
                 else $scope.showAlert('Houve uma falha ao obter dados da conciliação bancária (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyDadosPos);
              });  
    }
    
    /**
      * Incrementa o total de registros associados a recebimentoparcela
      */
    $scope.incrementaContRecebimentosParcelas = function(RecebimentosParcela){
        if(RecebimentosParcela != null) $scope.totais.contRecebimentosParcela += RecebimentosParcela.length;
    }
    /**
      * Incrementa o total de registros associados a extrato
      */
    $scope.incrementaContExtratoBancario = function(ExtratoBancario){
        if(ExtratoBancario != null) $scope.totais.contExtrato += ExtratoBancario.length;
    }
    
    
    
    // MODAL DETALHES
    $scope.detalhar = function(grupo){
        $scope.modalDetalhes.grupo = grupo;
        //console.log(grupo);
        // Exibe o modal
        $('#modalDetalhes').modal('show');
    }
    
    
    
    // AÇÕES
    /**
      * Solicita confirmação para o usuário quanto a conciliação
      */
    $scope.concilia = function(dado){
        // Confirma conciliação
        var carga = dado.RecebimentosParcela.length > 1 ? "as cargas" : "a carga";
        $scope.showModalConfirmacao('Confirmação', 
            "Uma vez confirmada a conciliação, a movimentação e " + carga + " não poderão se envolver em outra conciliação bancária. Confirma essa conciliação?",
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
            texto += "Foi encontrada 1 pré-conciliação. Uma vez confirmada a conciliação, a movimentação e ";
            if(preConciliados[0].RecebimentosParcela.length > 1) texto += "as cargas não poderão se envolver em outra conciliação bancária. Confirma essa conciliação?"
            else texto += "a carga";
        }else texto += "Foram encontradas " + total + " pré-conciliações. Uma vez confirmadas as conciliações, as movimentações e as cargas não poderão se envolver em outra conciliação bancária. Confirma essas conciliações?";
        // Exibe o modal de confirmação
        $scope.showModalConfirmacao('Confirmação', texto, concilia, preConciliados, 'Sim', 'Não');
    }
    /**
      * Efetiva a conciliação
      */
    var concilia = function(dadosConciliacao){
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyDadosPos);
        
        // Obtém o json
        var jsonConciliacaoBancaria = [];
        for(var k = 0; k < dadosConciliacao.length ; k++){
            var dado = dadosConciliacao[k];
            //console.log("DADO");console.log(dado);
            var json = { idExtrato : parseInt(dado.ExtratoBancario[0].Id), 
                         data : $scope.getDataFromString($scope.getDataString(dado.Data)),
                         idsRecebimento : []
                       };
            for(var j = 0; j < dado.RecebimentosParcela.length; j++)
                json.idsRecebimento.push(dado.RecebimentosParcela[j].Id);
            //console.log("JSON");console.log(json);
            // Adiciona
            jsonConciliacaoBancaria.push(json);
        }
        
        $webapi.update($apis.getUrl($apis.card.conciliacaobancaria, undefined,
                       {id: 'token', valor: $scope.token}), jsonConciliacaoBancaria)
            .then(function(dados){
                    //$scope.showAlert('Conciliação bancária realizada com sucesso!', true, 'success', true);
                    if($scope.associacaoManual.extrato && $scope.associacaoManual.extrato !== null &&
                       $scope.associacaoManual.recebimentos && $scope.associacaoManual.recebimentos !== null){
                        buscaDadosConciliacaoBancaria(true);
                    }else{
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
                     else $scope.showAlert('Houve uma falha ao realizar a conciliação bancária (' + failData.status + ')', true, 'danger', true); 
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyDadosPos);
                  });     
    }
    
    
    // EDIÇÃO DA DATA DE RECEBIMENTO 
    var fechaModalDataRecebimento = function(){
        $('#modalDataRecebimento').modal('hide');    
    }
    var exibeModalDataRecebimento = function(){
        $('#modalDataRecebimento').modal('show');    
    }
    /**
      * Valida a data informada e envia para o servidor
      */
    $scope.alteraDataRecebimento = function(){
        if(!$scope.modalDataRecebimento.dataValida){
            $scope.showModalAlerta('Data informada é inválida!');
            return;
        }
            
        if($scope.getDataString($scope.modalDataRecebimento.dado.Data) === $scope.modalDataRecebimento.data){
            // Não houve alterações
            fechaModalDataRecebimento();
            return;
        }
        
        // Envia para o servidor
        //console.log("ALTERA DATA PARA " + $scope.getDataFromString($scope.modalDataRecebimento.data));
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyDadosPos);
        
        // Obtém o json
        var jsonRecebimentoParcela = { dtaRecebimentoNova : $scope.getDataFromString($scope.modalDataRecebimento.data),
                                       dtaRecebimentoAtual : $scope.getDataFromString($scope.getDataString($scope.modalDataRecebimento.dado.Data)),
                                       idsRecebimento : []
                                     };
        for(var k = 0; k < $scope.modalDataRecebimento.dado.RecebimentosParcela.length; k++)
            jsonRecebimentoParcela.idsRecebimento.push($scope.modalDataRecebimento.dado.RecebimentosParcela[k].Id);
        
        
        //console.log(jsonRecebimentoParcela);
        //$scope.hideProgress(divPortletBodyFiltrosPos);
        //$scope.hideProgress(divPortletBodyDadosPos);

        $webapi.update($apis.getUrl($apis.pos.recebimentoparcela, undefined,
                       {id: 'token', valor: $scope.token}), jsonRecebimentoParcela)
            .then(function(dados){
                    //$scope.showAlert('Data de recebimento alterada com sucesso!', true, 'success', true);
                    // Fecha o modal
                    fechaModalDataRecebimento();
                    // Refaz a busca de conciliação
                    buscaDadosConciliacaoBancaria(true);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar data de recebimento (' + failData.status + ')', true, 'danger', true); 
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyDadosPos);
                  });     
    }
    $scope.exibeModalDataRecebimento = function(dado){
        $scope.modalDataRecebimento.dado = dado;
        $scope.modalDataRecebimento.data = $scope.getDataString(dado.Data);
        $scope.modalDataRecebimento.dataValida = true;
        // Exibe o modal
        exibeModalDataRecebimento();
    }
    /**
      * Valida a data informada
      */
    $scope.validaData = function(){
        if($scope.modalDataRecebimento.data){
            if($scope.modalDataRecebimento.data.length < 10) $scope.modalDataRecebimento.dataValida = false;
            else{
                var parts = $scope.modalDataRecebimento.data.split("/");
                var data = new Date(parts[2], parts[1] - 1, parts[0]);
                // Verifica se a data é válida
                $scope.modalDataRecebimento.dataValida =  parts[0] == data.getDate() && 
                                                          (parts[1] - 1) == data.getMonth() && 
                                                          parts[2] == data.getFullYear();
            }
        }else $scope.modalDataRecebimento.dataValida = false;
    };
                                                 
                                                 
                                                 
                                                 
                                                 
    // ASSOCIAÇÃO MANUAL   
    /**
      * Selecionou movimentação bancária para conciliar manualmente
      */
    $scope.associaExtratoBancario = function(dado){
        $scope.associacaoManual.selecionandoRecebimentos = true;
        $scope.associacaoManual.extrato = dado.ExtratoBancario;
        $scope.associacaoManual.dtExtrato = dado.Data;
        $scope.associacaoManual.recebimentos = null;
        $scope.associacaoManual.valorExtrato = dado.ValorTotalExtrato;
        $scope.associacaoManual.adquirenteExtrato = dado.Adquirente;
    }
    /**
      * Desistiu da conciliação manual
      */
    $scope.desassociaExtratoBancario = function(){
        $scope.associacaoManual.selecionandoRecebimentos = false;
        $scope.associacaoManual.extrato = null;
        $scope.associacaoManual.dtExtrato = '';
        $scope.associacaoManual.recebimentos = null;
        $scope.associacaoManual.valorExtrato = 0.0;
        $scope.associacaoManual.adquirenteExtrato = '';
    }
    /**
      * Retorna true se o dado informado corresponde ao extrato selecionado para conciliação manual
      */
    $scope.isExtratoSelecionado = function(dado){
        if(!dado || !$scope.associacaoManual.extrato || dado === null || $scope.associacaoManual.extrato === null) 
            return false;
        return dado.ExtratoBancario[0].Id === $scope.associacaoManual.extrato[0].Id;
    }
    /**
      * Retorna true se o dado informado corresponde ao extrato selecionado para conciliação manual
      */
    $scope.isMesmaDataEAdquirenteExtratoSelecionado = function(dado){
        if(!dado || !$scope.associacaoManual.extrato || dado === null || 
           $scope.associacaoManual.extrato === null || !$scope.associacaoManual.dtExtrato ||
           !$scope.associacaoManual.adquirenteExtrato) 
            return false;
        return $scope.getDataString(dado.Data) === $scope.getDataString($scope.associacaoManual.dtExtrato) && 
               $scope.associacaoManual.adquirenteExtrato === dado.Adquirente;
    }
    /**
      * Selecionou o grupo de recebimentos para conciliar com o extrato selecionado para conciliação manual
      * Solicita confirmação ao usuário
      */
    $scope.associaRecebimentos = function(dado){
        $scope.associacaoManual.recebimentos = dado.RecebimentosParcela;
        
        var d = { ExtratoBancario : $scope.associacaoManual.extrato, 
                  RecebimentosParcela : $scope.associacaoManual.recebimentos,
		          Data : $scope.associacaoManual.dtExtrato
                };
        
        var carga = $scope.associacaoManual.recebimentos.length > 1 ? "as cargas" : "a carga";
        $scope.showModalConfirmacao('Confirmação', 
            "Uma vez confirmada a conciliação, a movimentação e " + carga + " não poderão se envolver em outra conciliação bancária. Confirma essa conciliação de movimentação com valor de " + $filter('currency')($scope.associacaoManual.valorExtrato, 'R$', 2) + ' e ' + carga + ' com valor total de ' + $filter('currency')(dado.ValorTotalRecebimento, 'R$', 2) + '?',
            concilia, [d], 'Sim', 'Não');
    }
}]);