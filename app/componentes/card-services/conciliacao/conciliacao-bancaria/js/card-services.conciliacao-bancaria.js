/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
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
                      contExtrato : 0, contRecebimentosParcela : 0};
    $scope.adquirentes = [];
    $scope.filiais = [];
    $scope.tipos = [{id: 1, nome: 'CONCILIADO'}, {id: 2, nome: 'NÃO CONCILIADO'}];                                             
    $scope.filtro = {datamin : new Date(), datamax : '', 
                     tipo : $scope.tipos[1], adquirente : undefined, filial : undefined,
                     itens_pagina : $scope.itens_pagina[1], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };  
    
                                                 
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyDadosPos = 1;  
    // Modal Detalhes
    $scope.modalDetalhes = {grupo : [] };                                             
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
    // Flags 
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
       // Data
       var filtroData = {id: /*$campos.card.conciliacaobancaria.data*/ 100,
                         valor: $scope.getFiltroData($scope.filtro.datamin)}; 
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       filtros.push(filtroData);
    
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
        
       $scope.showProgress(divPortletBodyFiltrosPos);    
        
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
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos);    
        
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
                if(!idOperadora) $scope.filtro.adquirente = null;
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
    $scope.alterouTipo = function(){
        //console.log($scope.filtro.tipo);  
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
    
    var buscaDadosConciliacaoBancaria = function(){
        if(!$scope.usuariologado.grupoempresa ||  !$scope.filtro.filial || $scope.filtro.filial === null) 
            return;
        
        $scope.showProgress(divPortletBodyFiltrosPos);
        $scope.showProgress(divPortletBodyDadosPos);
        
        // Filtro  
        var filtros = obtemFiltroDeBusca();
           
        $webapi.get($apis.getUrl($apis.card.conciliacaobancaria, 
                                [$scope.token, 0, 
                                 /*$campos.card.conciliacaobancaria.data*/ 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                $scope.totais.contExtrato = $scope.totais.contRecebimentosParcela = 0;
            
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
            concilia, dado, 'Sim', 'Não');  
    }
    /**
      * Efetiva a conciliação
      */
    var concilia = function(dado){
        $scope.showProgress(divPortletBodyFiltrosPos);
        $scope.showProgress(divPortletBodyDadosPos);
        
        // Obtém o json
        var json = { idExtrato : parseInt(dado.ExtratoBancario[0].Id), 
                     idsRecebimento : []
                   };
        for(var k = 0; k < dado.RecebimentosParcela.length; k++)
            json.idsRecebimento.push(dado.RecebimentosParcela[k].Id);

        $webapi.update($apis.getUrl($apis.pos.recebimentoparcela, undefined,
                       {id: 'token', valor: $scope.token}), json)
            .then(function(dados){
                    //$scope.showAlert('Conciliação bancária realizada com sucesso!', true, 'success', true);
                    // Altera o status da conciliação
                    dado.Conciliado = 1;
                    // Esconde o progress
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyDadosPos);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao realizar a conciliação bancária (' + failData.status + ')', true, 'danger', true); 
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyDadosPos);
                  });     
    }
    
    $scope.procuraDadoConciliacao = function(dado){
        //console.log("PROCURA");
        //console.log(dado);    
    }
    
}]);