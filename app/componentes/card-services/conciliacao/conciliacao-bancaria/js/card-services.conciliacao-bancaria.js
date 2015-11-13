/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.1.2 - 13/11/2015
 *  - Envio dos idsExtrato em vez da data e idsRecebimento para download CSV
 *
 *  Versão 1.1.1 - 12/11/2015
 *  - Ajuste no envio da data do json para download do CSV
 *
 *  Versão 1.1.0 - 11/11/2015
 *  - Download CSV
 *
 *  Versão 1.0.9 - 05/11/2015
 *  - Diferença exibida dos valores da conciliação manual
 *
 *  Versão 1.0.8 - 04/11/2015
 *  - Conta Corrente
 *
 *  Versão 1.0.7 - 30/10/2015
 *  - Só permite conciliação de memos amarrados a um filial com a filial correspondente
 *
 *  Versão 1.0.6 - 28/10/2015
 *  - Desfazer conciliação
 *
 *  Versão 1.0.5 - 13/10/2015
 *  - Seleção de TODAS as filiais
 *  - Combo ADQUIRENTE sendo preenchida pela tabela tbAdquirente em vez de Operadora
 *
 *  Versão 1.0.4 - 05/10/2015
 *  - Seleção múltipla de cargas agrupadas na conciliação manual
 *
 *  Versão 1.0.3 - 21/09/2015
 *  - Recebendo e enviando numParcela de Recebimento Parcela
 *  - Busca somente filiais ativas
 *
 *  Versão 1.0.2 - 08/09/2015
 *  - Correção: quando empresa é desassociada, é exibido todos os valores zerados referente aos registros
 *
 *  Versão 1.0.1 - 04/09/2015
 *  - Movimentações bancárias não pré-conciliadas podem ser associadas manualmente com um grupo de Recebimentos
 *
 *  Versão 1.0 - 03/09/2015
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
                                             '$autenticacao',
                                             '$apis',
                                             '$window',
                                             function($scope,$state,$filter,$timeout,$http,
                                                      /*$campos,*/$webapi,$autenticacao,$apis,$window){ 
    
    // flags
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200];                                             
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados    
    $scope.dadosconciliacao = [];
    $scope.dadosTitulos = [];
    $scope.totais = { totalExtrato : 0.0, totalRecebimentosParcela : 0.0,
                      contExtrato : 0, contRecebimentosParcela : 0,
                    };
    var totalPreConciliados = 0;    
    var totalConciliados = 0;                                             
    $scope.adquirentes = [];
    $scope.filiais = [];
    $scope.filiaisgrupo = [];                                             
    $scope.contas = [];                                             
    $scope.tipos = [{id: 1, nome: 'CONCILIADO'}, {id: 2, nome: 'PRÉ-CONCILIADO'}, {id: 3, nome: 'NÃO CONCILIADO'}];             
    $scope.filtro = {datamin : new Date(), datamax : '', consideraPeriodo : true,
                     tipo : null, adquirente : undefined, filial : undefined, conta : undefined,
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
    // flags                                                  
    $scope.exibeTela = false;    
    $scope.abrirCalendarioDataMin = $scope.abrirCalendarioDataVendaMin = false;
    $scope.abrirCalendarioDataMax = $scope.abrirCalendarioDataVendaMax = false;                                           
    $scope.modalDetalhesShowing = false;
    
    
    // Inicialização do controller
    $scope.cardServices_conciliacaoBancariaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Conciliação Bancária';
        //console.log('USER: ');
        //console.log($scope.usuariologado);
        //console.log($scope.usuariologado.grupoempresa);
        //console.log($scope.usuariologado.grupoempresa.id_grupo);
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
                    $scope.filtro.filial = $scope.filtro.conta = $scope.filtro.adquirente = null;
                    buscaFiliais(true);
                    buscaContas();
                }else{ // reseta tudo e não faz buscas 
                    $scope.dadosconciliacao = []; 
                    $scope.filiais = [];
                    $scope.contas = [];
                    $scope.filtro.filial = $scope.filtro.conta = $scope.filtro.adquirente = null;
                    
                    $scope.filtro.faixa_registros = '0-0';
                    $scope.filtro.total_registros = 0;
                    $scope.filtro.pagina = 1;
                    
                    $scope.totais.totalExtrato = 0.0;
                    $scope.totais.totalRecebimentosParcela = 0.0;
                    $scope.totais.contExtrato = 0;
                    $scope.totais.contRecebimentosParcela = 0;
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
            if($scope.usuariologado.grupoempresa){ 
                buscaFiliais(true);
                buscaContas();
            }
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    };
    
    
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode alterar dados de conciliação bancária
      */
    $scope.usuarioPodeAlterarDadosConciliacaoBancaria = function(){
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
        
        if($scope.filtro.conta && $scope.filtro.conta !== null){
            $scope.filiais = $scope.filiaisgrupo;
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false);
        }else if($scope.filiais.length > 0 && $scope.filtro.filial !== $scope.filiais[0]){
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false); 
        }
        
        $scope.filtro.conta = null;
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
        
       // Conta
       if($scope.filtro.conta && $scope.filtro.conta !== null){
           var filtroConta = {id: /*$campos.card.conciliacaobancaria.cdContaCorrente*/ 400, 
                              valor: $scope.filtro.conta.cdContaCorrente};
           filtros.push(filtroConta);  
       }
        
       // Filial
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           var filtroFilial = {id: /*$campos.card.conciliacaobancaria.nu_cnpj*/ 103, 
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: 300,//$campos.card.conciliacaobancaria.tbadquirente + $campos.card.tbadquirente.cdAdquirente - 100, 
                                   valor: $scope.filtro.adquirente.cdAdquirente};
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
                                                 
                                                 
                                                 
                                                 
    // CONTAS
    /**
      * Busca as contas correntes
      */
    var buscaContas = function(){
        
         // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            return;   
        }
        
        //$scope.showProgress(divPortletBodyFiltrosPos, 10000);
        
        // Filtro  
        var filtros = {id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                      valor: $scope.usuariologado.grupoempresa.id_grupo};
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0],
                                filtros)) 
            .then(function(dados){           

                // Obtém as contas correntes
                $scope.contas = dados.Registros;
            
                if($scope.filtro.conta && $scope.filtro.conta !== null)
                    $scope.filtro.conta = $filter('filter')($scope.contas, function(c) {return c.cdContaCorrente === $scope.filtro.conta.cdContaCorrente;})[0];
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 //$scope.hideProgress(divPortletBodyFiltrosPos);
              });       
    };
    /**
      * Selecionou uma conta
      */
    $scope.alterouConta = function(progressemexecucao){
        if($scope.filtro.conta && $scope.filtro.conta !== null){
            // Filiais associadas a conta
            buscaFiliaisDaConta(true);
        }else{
            $scope.filiais = $scope.filiaisgrupo;
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false);
        }
    };   
          
                                                 
    // FILIAIS                                             
    /**
      * Busca as filiais associadas à conta
      */                                              
    var buscaFiliaisDaConta = function(){
        
       if(!$scope.filtro.conta || $scope.filtro.conta === null) return;
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];

       filtros.push({id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.cdContaCorrente*/ 100, valor: $scope.filtro.conta.cdContaCorrente}); 
       
       $webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, 
                                [$scope.token, 3],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                $scope.filtro.filial = null;
                buscaAdquirentesConta(true); // Busca adquirentes
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais associadas à conta (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };                                             
                                                 
    
    
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
                $scope.filiais = $scope.filiaisgrupo = dados.Registros;
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
        if($scope.filtro.conta && $scope.filtro.conta !== null){
            if($scope.filtro.filial && $scope.filtro.filial !== null)
                $scope.adquirentes = $scope.filtro.filial.adquirentes;
            else buscaAdquirentesConta(false);
        }else buscaAdquirentes(false);
    };
    
                                                                                         
    // ADQUIRENTES 
    /**
      * Busca as adquirentes associadas à conta
      */
    var buscaAdquirentesConta = function(progressEstaAberto){ 
        
       if(!$scope.filtro.conta || $scope.filtro.conta === null){ 
           if(progressEstaAberto) $scope.hideProgress(divPortletBodyFiltrosPos);
           return;
       }
            
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.cdContaCorrente*/ 100, 
                       valor: $scope.filtro.conta.cdContaCorrente}];
       
       
       $webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, 
                                [$scope.token, 4],
                                filtros))
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                $scope.filtro.adquirente = null; 
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes da conta (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }                                             
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
    $scope.temElementosConciliados = function(){
        return totalConciliados > 0;
    }
    $scope.incrementaTotalConciliados = function(incrementa){
        if(incrementa) totalConciliados++;    
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
        if((!$scope.filtro.conta || $scope.filtro.conta === null) && (!$scope.filtro.adquirente || $scope.filtro.adquirente === null)){
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
        buscaDadosConciliacaoBancaria();
    }
    
    var buscaDadosConciliacaoBancaria = function(progressoemexecucao){
        if(!$scope.usuariologado.grupoempresa || ((!$scope.filtro.conta || $scope.filtro.conta === null) && (!$scope.filtro.adquirente || $scope.usuariologado.adquirente === null))) 
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
            
                $scope.totais.contExtrato = $scope.totais.contRecebimentosParcela = totalPreConciliados = totalConciliados = 0;
            
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
        $scope.modalDetalhesShowing = true;
        checaVisibilidadeModal();
    }
    
    var checaVisibilidadeModal = function(){
        $timeout(function(){if($scope.modalIsVisible()) checaVisibilidadeModal(); /*else console.log("FALSE");*/}, 1000);
    }
    
        
    
    
    // MODAL DETALHES
    $scope.detalharTitulos = function(grupo, titulos){
        $scope.modalDetalhesTitulos = titulos;
        $scope.modalDetalhesGrupo = grupo;
        //console.log(grupo);
        // Exibe o modal
        $('#modalDetalhesTitulos').modal('show');
    }
    

    
    
    
    // AÇÕES
    /**
      * Solicita confirmação para o usuário quanto a desconciliação
      */
    $scope.desconcilia = function(dado){
        var dadoE = angular.copy(dado);
        dadoE.ExtratoBancario[0].Id = -1; // desfazer conciliação
        //console.log(dado);
        //console.log(dadoE);
        // Confirma a desconciliação
        //var carga = dadoE.RecebimentosParcela.length > 1 ? "as cargas" : "a carga";
        $scope.showModalConfirmacao('Confirmação', 
            "Tem certeza que deseja desfazer a conciliação selecionada?",
            concilia, [dadoE], 'Sim', 'Não');  
    }
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
                         //data : $scope.getDataFromString($scope.getDataString(dado.Data)),
                         //idsRecebimento : []
                         recebimentosParcela : []
                       };
            for(var j = 0; j < dado.RecebimentosParcela.length; j++){
                //json.idsRecebimento.push(dado.RecebimentosParcela[j].Id);
                var rp = dado.RecebimentosParcela[j];
                json.recebimentosParcela.push({idRecebimento : rp.Id, 
									           numParcela : rp.NumParcela});
            }
            //console.log("JSON");console.log(json);
            // Adiciona
            jsonConciliacaoBancaria.push(json);
        }
        
        $webapi.update($apis.getUrl($apis.card.conciliacaobancaria, undefined,
                       {id: 'token', valor: $scope.token}), jsonConciliacaoBancaria)
            .then(function(dados){
                    //$scope.showAlert('Conciliação bancária realizada com sucesso!', true, 'success', true);
                    if($scope.associacaoManual.extrato && $scope.associacaoManual.extrato !== null &&
                       $scope.associacaoManual.recebimentos && $scope.associacaoManual.recebimentos !== null || 
                       jsonConciliacaoBancaria[0].idExtrato === -1){
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
        var jsonRecebimentoParcela = { //dtaRecebimentoNova : $scope.getDataFromString($scope.modalDataRecebimento.data),
                                       //dtaRecebimentoAtual : $scope.getDataFromString($scope.getDataString($scope.modalDataRecebimento.dado.Data)),
                                       //idsRecebimento : []
                                       dtaRecebimentoEfetivo : $scope.getDataFromString($scope.modalDataRecebimento.data),
                                       recebimentosParcela: []
                                     };
        for(var k = 0; k < $scope.modalDataRecebimento.dado.RecebimentosParcela.length; k++){
            var rp = $scope.modalDataRecebimento.dado.RecebimentosParcela[k];
            //jsonRecebimentoParcela.idsRecebimento.push($scope.modalDataRecebimento.dado.RecebimentosParcela[k].Id);
            jsonRecebimentoParcela.recebimentosParcela.push({idRecebimento : rp.Id, 
									                         numParcela : rp.NumParcela});
        }
        
        
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
                                                 

    /**
    * BEGIN BAIXA AUTOMÁTICA = PETROX
    */
                                                 
                                                 
            /**
            * Busca parcelas da Venda
            */
            $scope.coparaVendaTitulo = function(nsu)
            {
                var nsuTitulo = '';
                var numVendas = 0;
                for(var a = 0; a < $scope.modalDetalhesGrupo.length; a++)
                {
                    if(nsu.indexOf($scope.modalDetalhesGrupo[a].Documento) > 0)
                    {
                        nsuTitulo = $scope.modalDetalhesGrupo[a].Documento;
                        return $scope.modalDetalhesGrupo[a].NumParcela;
                    }
                }
            }



            // SOMA GRUPO DE TITULOS
            $scope.SomaGrupoDeTitulos = function(registros)
            {
                var soma = 0;
                 for(var k = 0; k < registros.length; k++)
                    soma = soma + registros[k].val_original - registros[k].val_taxa_cobranca;

                return soma;
            }

            /**
            * Consulta Titulos no ERP do Cliente - PETROX
            */
            $scope.consultaErp = function(dados)
            {
                $scope.showProgress(divPortletBodyFiltrosPos, 10000);
                $scope.showProgress(divPortletBodyDadosPos);

                var indice = -1;
                for(var a = 0; a < $scope.dadosconciliacao.length; a++)
                {
                    if( $scope.dadosconciliacao[a].$$hashKey === dados.$$hashKey)
                        indice = a;
                }

                var RecebimentosParcela = dados.RecebimentosParcela;
                if(RecebimentosParcela != undefined && RecebimentosParcela.length > 0)
                {
                    var filtros = [];
                    var item = '';
                    for(var r = 0; r < RecebimentosParcela.length; r++){
                        item = '177:'+ RecebimentosParcela[r].Documento + ','
                                     + '106:'+RecebimentosParcela[r].DataVenda.substring(0,10).replace('-','').replace('-','');
                        filtros.push({  id: r, valor: item});
                    }

                $webapi.post($apis.getUrl($apis.rezende.pgsql.tabtituloreceber, undefined,
                                         {id : 'token', valor : $scope.token}), filtros) 
                    .then(function(dados){           
                        $scope.hideProgress(divPortletBodyFiltrosPos);
                        $scope.hideProgress(divPortletBodyDadosPos);
                        $scope.dadosTitulos.push({ id: $scope.dadosconciliacao[indice].$$hashKey, values: dados });
                      },
                      function(failData){
                         if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                         else if(failData.status === 500) $scope.showAlert('Titulos não encontrado!', true, 'warning', true); 
                         else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                         else $scope.showAlert('Houve uma falha ao consultar os titulos (' + failData.status + ')', true, 'danger', true);
                         // Fecha os progress
                            $scope.hideProgress(divPortletBodyFiltrosPos);
                            $scope.hideProgress(divPortletBodyDadosPos);
                      }); 
                }
            }
            
            
            
            
            
            /**
            * Consulta Titulos no ERP do Cliente - PETROX
            */
            $scope.baixaAuto = function(dados)
            {
                
                $scope.showProgress(divPortletBodyFiltrosPos, 10000);
                $scope.showProgress(divPortletBodyDadosPos);

                /*var indice = -1;
                for(var a = 0; a < $scope.dadosconciliacao.length; a++)
                {
                    if( $scope.dadosconciliacao[a].$$hashKey === dados.$$hashKey)
                        indice = a;
                }

                var RecebimentosParcela = dados.RecebimentosParcela;
                if(RecebimentosParcela != undefined && RecebimentosParcela.length > 0)
                {
                    var filtros = [];
                    var item = '';
                    for(var r = 0; r < RecebimentosParcela.length; r++){
                        item = '177:'+ RecebimentosParcela[r].Documento + ','
                                     + '106:'+RecebimentosParcela[r].DataVenda.substring(0,10).replace('-','').replace('-','');
                        filtros.push({  id: r, valor: item});
                    }
                */
                
                $webapi.post($apis.getUrl($apis.rezende.pgsql.baixaautomatica, undefined,
                                         {id : 'token', valor : $scope.token}), dados) 
                    .then(function(dados){           
                        $scope.hideProgress(divPortletBodyFiltrosPos);
                        $scope.hideProgress(divPortletBodyDadosPos);
                        $scope.dadosTitulos.push({ id: $scope.dadosconciliacao[indice].$$hashKey, values: dados });
                      },
                      function(failData){
                         if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                         else if(failData.status === 500) $scope.showAlert('Titulos não encontrado!', true, 'warning', true); 
                         else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                         else $scope.showAlert('Houve uma falha ao consultar os titulos (' + failData.status + ')', true, 'danger', true);
                         // Fecha os progress
                            $scope.hideProgress(divPortletBodyFiltrosPos);
                            $scope.hideProgress(divPortletBodyDadosPos);
                      }); 
                }

    /**
    * END BAIXA AUTOMÁTICA = PETROX
    */
                                                 
                                                 
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
        
        // todos os dados ficam desmarcados
        for(var k = 0; k < $scope.dadosconciliacao.length; k++)
            $scope.dadosconciliacao[k].selecionado = false;
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
               $scope.associacaoManual.adquirenteExtrato === dado.Adquirente && (!$scope.associacaoManual.extrato[0].Filial || $scope.associacaoManual.extrato[0].Filial === dado.RecebimentosParcela[0].Filial);
    }
    /**
      * Selecionou o grupo de recebimentos para conciliar com o extrato selecionado para conciliação manual
      * Solicita confirmação ao usuário
      */
    $scope.associaRecebimentosSelecionados = function(){
        
        var dados = $filter('filter')($scope.dadosconciliacao, function(d){return d.selecionado === true});
        
        if(dados.length === 0){
            $scope.showModalAlerta('Nenhum conjunto de cargas foi selecionado!');
            return;    
        }
        
        //$scope.associacaoManual.recebimentos = dado.RecebimentosParcela;
        var totalRecebimento = 0.0;
        $scope.associacaoManual.recebimentos = [];
        for(var k = 0; k < dados.length; k++){
            var dado = dados[k];
            totalRecebimento += dado.ValorTotalRecebimento;
            for(var r = 0; r < dado.RecebimentosParcela.length; r++)
               $scope.associacaoManual.recebimentos.push(dado.RecebimentosParcela[r]);      
        }
        
        var d = { ExtratoBancario : $scope.associacaoManual.extrato, 
                  RecebimentosParcela : $scope.associacaoManual.recebimentos,
		          Data : $scope.associacaoManual.dtExtrato
                };
        
        var carga = $scope.associacaoManual.recebimentos.length > 1 ? "as cargas" : "a carga";
        $scope.showModalConfirmacao('Confirmação', 
            "Uma vez confirmada a conciliação, a movimentação e " + carga + " não poderão se envolver em outra conciliação bancária. Confirma essa conciliação de movimentação com valor de " + $filter('currency')($scope.associacaoManual.valorExtrato, 'R$', 2) + ' e ' + carga + ' com valor total de ' + $filter('currency')(totalRecebimento, 'R$', 2) + ' (diferença de ' + $filter('currency')(Math.abs(totalRecebimento - $scope.associacaoManual.valorExtrato), 'R$', 2) + ')?',
            concilia, [d], 'Sim', 'Não');
    }
    
    $scope.modalIsVisible = function(){
        $scope.modalDetalhesShowing = $('#modalDetalhes').is(':visible');
        return $scope.modalDetalhesShowing;
    }
    
    
    /**
      *  Download arquivo em CSV
      */
    $scope.downloadCSV = function(dado){
        
        //if(!dado || dado === null || !dado.Data || dado.Data === null ||
        //   !dado.RecebimentosParcela || dado.RecebimentosParcela == null) return;
        if(!dado || dado === null || !dado.ExtratoBancario || dado.ExtratoBancario === null) 
            return;
        
        var url = $apis.getUrl($apis.card.conciliacaobancaria, undefined,
                       {id: 'token', valor: $scope.token});
        // Seta para a url de download
        if(url.slice(0, "http://localhost:".length) !== "http://localhost:")
            url = url.replace($autenticacao.getUrlBase(), $autenticacao.getUrlBaseDownload());
        
        //var data = dado.Data.replace("-", "").replace("-", "").substr(0, 8); 
        //var data = $scope.getFiltroData($scope.getDataFromDate(dado.Data));
        
        //var json = { dataRecebimento : data,
        //             idsRecebimento : []}; 
        
        //for(var k = 0; k < dado.RecebimentosParcela.length; k++)
        //    json.idsRecebimento.push(dado.RecebimentosParcela[k].Id);
        var json = { idExtrato : dado.ExtratoBancario[0].Id };

        
        // Download
        $scope.download(url, 'Conciliação Bancária.csv', true, divPortletBodyDadosPos, divPortletBodyFiltrosPos, undefined, undefined, [json]);           
    }
    
    
    /**
      *  Download arquivos CSV em zip
      */
    $scope.downloadCSVs = function(dado){
        
        var conciliados = $filter('filter')($scope.dadosconciliacao, function(c){ return c.Conciliado === 1 }); 
        var total = conciliados.length;
        // Tem elementos conciliados?
        if(total === 0){
            $scope.showModalAlerta('Não há dados conciliados em exibição!');
            return;        
        } 
        
        var param = [];
        
        for(var j = 0; j < conciliados.length; j++){
            var dado = conciliados[j];
            //var data = dado.Data.replace("-", "").replace("-", "").substr(0, 8); 
            //var data = $scope.getFiltroData($scope.getDataFromDate(dado.Data));
            //var json = { dataRecebimento : data,
            //            idsRecebimento : []}; 
            //for(var k = 0; k < dado.RecebimentosParcela.length; k++)
            //   json.idsRecebimento.push(dado.RecebimentosParcela[k].Id);
            param.push({ idExtrato : dado.ExtratoBancario[0].Id });
        }
        
        var url = $apis.getUrl($apis.card.conciliacaobancaria, undefined,
                       {id: 'token', valor: $scope.token});
        // Seta para a url de download
        if(url.slice(0, "http://localhost:".length) !== "http://localhost:")
            url = url.replace($autenticacao.getUrlBase(), $autenticacao.getUrlBaseDownload());
        
        // Download
        $scope.download(url, 'Conciliação Bancária.zip', true, divPortletBodyDadosPos, divPortletBodyFiltrosPos, undefined, undefined, param);           
    }
    
}]);